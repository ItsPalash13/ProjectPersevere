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
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Chip,
  Drawer
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Star as StarIcon, 
  Close as CloseIcon,
  Timer as TimerIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Help as HelpIcon
} from '@mui/icons-material';
import { 
  QuizContainer,
  QuestionCard,
  OptionCard,
  QuizHeader,
  StyledButton,
  TimeDisplay,
  XpDisplay,
  CongratsDialog,
  EmojiDisplay,
  FloatingButton,
  quizStyles
} from '../../theme/quizTheme';



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
  const [showAnswerDrawer, setShowAnswerDrawer] = useState(false);
  const lastUpdateTimeRef = React.useRef(0);
  const timerIntervalRef = React.useRef(null);
  const [attemptType, setAttemptType] = useState(null);

  const initializedRef = React.useRef(false);
  const socketInitializedRef = React.useRef(false);

  const formatTime = (seconds, ongame = false) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const tenths = Math.floor((seconds % 1) * 10);
    if (ongame) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${tenths}`;
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
      answer: parseInt(selectedAnswer),
      currentTime: currentTime
    });
    console.log("currentTime", currentTime);
  };

  const handleNextQuestion = () => {
    setAnswerResult(null);
    setShowAnswerDrawer(false);
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
    navigate(`/chapter/${levelSession?.chapterId}`, { replace: true });
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
    if (quizFinished || isLoading) {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      return;
    }

    timerIntervalRef.current = setInterval(() => {
      setCurrentTime(prev => {
        const now = Date.now();
        let newTime;
        
        if (attemptType === 'time_rush') {
          newTime = prev - 0.1;
          if (newTime <= 0) {
            socket.emit('sendTimesUp', { userLevelSessionId: levelSession._id });
            clearInterval(timerIntervalRef.current);
          }
        } else {
          // Precision Path: increment time
          newTime = prev + 0.1;
        }

        if (Math.floor(newTime) % 1 === 0 && levelSession._id && !quizFinished && now - lastUpdateTimeRef.current >= 1000) {
          console.log('sending update time');
          socket.emit('sendUpdateTime', { currentTime: Math.floor(newTime), userLevelSessionId: levelSession._id });
          lastUpdateTimeRef.current = now;
        }
        
        return Number(newTime.toFixed(1));
      });
    }, 100);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [quizFinished, isLoading, levelSession?._id, socket, attemptType]);

  useEffect(() => {
    if (!levelSession?._id || quizFinished || socketInitializedRef.current) {
      return;
    }

    socket.on('connect', () => {
      console.log("Socket connected, getting level session");
      getLevelSession();
    });

    socket.on('levelSession', (data) => {
      console.log("Received level session data:", data);
      setAttemptType(data.attemptType);
      
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

      if (data.attemptType === 'time_rush' && data.timeRush) {
        setCurrentTime(data.timeRush.currentTime);
        setCurrentXp(data.timeRush.currentXp);
      } else if (data.attemptType === 'precision_path' && data.precisionPath) {
        setCurrentTime(data.precisionPath.currentTime);
        setCurrentXp(data.precisionPath.currentXp);
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
      setShowAnswerDrawer(true);
    });

    socket.on('levelCompleted', ({ message, attemptType: eventAttemptType }) => {
      console.log("Level completed:", message, eventAttemptType);
      if (eventAttemptType === 'time_rush') {
        // For Time Rush, show congrats
        setShowCongrats(true);
      }
    });

    socket.on('quizFinished', (data) => {
      console.log("Quiz finished:", data);
      setQuizFinished(true);
      setQuizResults(data);
      setShowResults(true);
    });

    socket.on('quizError', ({ type, message }) => {
      console.error('Quiz error:', { type, message });
      if (type === 'failure') {
        setErrorMessage(message);
        setShowError(true);
        setQuizFinished(true);
      } else {
        // For non-critical errors, show as temporary message
        setQuizMessage(message);
        // Clear the message after 5 seconds for better UX
        setTimeout(() => {
          setQuizMessage('');
        }, 5000);
      }
    });

    socketInitializedRef.current = true;

    return () => {
      console.log("Cleaning up socket connection");
      socket.off('connect');
      socket.off('question');
      socket.off('quizFinished');
      socket.off('quizError');
      socket.off('answerResult');
      socket.off('levelCompleted');
      socket.off('levelSession');
      socketInitializedRef.current = false;
      initializedRef.current = false;
    };
  }, [levelSession?._id, quizFinished, socket, showResults]);

  const renderResults = () => {
    if (!quizResults) return null;

    const isTimeRush = quizResults.attemptType === 'time_rush';
    const data = isTimeRush ? quizResults.timeRush : quizResults.precisionPath;
    const progressPercent = Math.min((data.currentXp / data.requiredXp) * 100, 100);
    const isLevelCompleted = data.currentXp >= data.requiredXp;

    return (
      <>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={quizStyles.resultsXpBox}>
            <StarIcon sx={{ fontSize: '2rem' }} />
            <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
              {data.currentXp}
          </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              XP
            </Typography>
          </Box>
          
          <Box sx={quizStyles.resultsStatsContainer}>
            <Typography variant="body1" color="text.secondary">
            Required: {data.requiredXp} XP
          </Typography>
          {isTimeRush ? (
              <Typography variant="body1" color="text.secondary">
              Max Score: {data.maxXp} XP
            </Typography>
          ) : (
              <Typography variant="body1" color="text.secondary">
              Best Time: {formatTime(data.bestTime)}
            </Typography>
          )}
          </Box>
        </Box>

        <Box sx={quizStyles.progressBarContainer}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Progress: {progressPercent.toFixed(1)}%
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={progressPercent}
            sx={{ 
              ...quizStyles.progressBar,
              '& .MuiLinearProgress-bar': {
                ...quizStyles.progressBar['& .MuiLinearProgress-bar'],
                ...(isLevelCompleted ? quizStyles.progressBarCompleted : quizStyles.progressBarIncomplete),
              }
            }}
          />
        </Box>

        <Box sx={quizStyles.resultsMessageBox}>
          <Typography variant="body1" sx={quizStyles.resultsMessageText}>
            {quizResults.message}
          </Typography>
        </Box>

        <Box sx={{ 
          ...quizStyles.resultsStatusBox,
          ...(isLevelCompleted ? quizStyles.resultsStatusCompleted : quizStyles.resultsStatusInProgress)
        }}>
          <Typography variant="h6" sx={{ 
            ...quizStyles.resultsStatusTitle,
            color: isLevelCompleted ? '#2e7d32' : theme => theme.palette.text.primary,
          }}>
            {isLevelCompleted ? "🎉 Level Completed!" : "💪 Keep Going!"}
        </Typography>
          <Typography variant="body2" color="text.secondary">
            {isLevelCompleted 
              ? "Amazing work! You've mastered this level!" 
              : "You're making great progress! Keep practicing to reach your goal!"}
          </Typography>
        </Box>
      </>
    );
  };

  return (
      <QuizContainer>
        <QuizHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              onClick={handleBack} 
              size="large"
              sx={quizStyles.backButton}
            >
              <ArrowBackIcon />
            </IconButton>
            <XpDisplay>
              <StarIcon />
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {currentXp} XP
              </Typography>
            </XpDisplay>
          </Box>
          <StyledButton
            variant="contained"
            color="error"
            onClick={handleEndQuiz}
            disabled={!!quizMessage}
          >
            End Quiz
          </StyledButton>
        </QuizHeader>

        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
          <TimeDisplay>
            <TimerIcon />
            {attemptType === 'time_rush' ? 'Time Remaining: ' : 'Time: '}
            {formatTime(currentTime, true)}
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
              <CardContent sx={quizStyles.questionCardContent}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Chip 
                    label="Question" 
                    size="small" 
                    sx={quizStyles.questionChip}
                  />
                </Box>
                <Typography 
                  variant="h5" 
                  component="h2" 
                  gutterBottom
                  sx={quizStyles.questionTitle}
                >
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
            title={showCorrectAnswer ? `Answer: ${currentQuestion.correctAnswer}` : "Show correct answer"}
          >
            {showCorrectAnswer ? currentQuestion.correctAnswer : <HelpIcon />}
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
                confirmEndQuiz();
                navigate(`/chapter/${levelSession?.chapterId}`, { replace: true });
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
            sx: quizStyles.resultsBackdrop
          }}
          PaperProps={{
            sx: quizStyles.resultsDialogPaper
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
            Quiz Results
          </DialogTitle>
          <DialogContent>
            {renderResults()}
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <StyledButton
              variant="contained"
              onClick={() => {
                setShowResults(false);
                navigate(`/chapter/${levelSession?.chapterId}`, { replace: true });
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
            sx: quizStyles.resultsBackdrop
          }}
          sx={quizStyles.errorDialog}
        >
          <DialogTitle sx={quizStyles.errorDialogTitle}>
            <CancelIcon sx={{ fontSize: '2rem' }} />
            Quiz Error
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3 }}>
              <Box sx={quizStyles.errorMessageBox}>
                <Typography variant="body1" sx={quizStyles.errorMessageText}>
                {errorMessage}
              </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Don't worry! Please return to levels and try again.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <StyledButton
              variant="contained"
              sx={quizStyles.errorDialogButton}
              onClick={() => {
                setShowError(false);
                navigate(`/chapter/${levelSession?.chapterId}`, { replace: true });
              }}
            >
              Back to Levels
            </StyledButton>
          </DialogActions>
        </Dialog>

        {/* Answer Result Drawer */}
        <Drawer
          anchor="bottom"
          open={showAnswerDrawer}
          onClose={() => setShowAnswerDrawer(false)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: answerResult?.isCorrect ? '#2e7d32' : '#d32f2f',
              color: 'white',
              padding: 2,
              textAlign: 'center',
              minHeight: '120px',
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              gap: 3,
            }
          }}
        >
          <Box sx={{ fontSize: '2.5rem' }}>
            {answerResult?.isCorrect ? '😊' : '😔'}
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {answerResult?.isCorrect ? 'Correct!' : 'Try Again'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {answerResult?.isCorrect 
                ? 'Great job! You got it right!' 
                : 'Don\'t worry, keep trying!'
              }
            </Typography>
          </Box>
          <StyledButton
            variant="contained"
            size="medium"
            onClick={handleNextQuestion}
            disabled={isLoading}
            sx={{
              backgroundColor: 'white',
              color: answerResult?.isCorrect ? '#2e7d32' : '#d32f2f',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Next Question
          </StyledButton>
        </Drawer>
      </QuizContainer>
  );
};

export default Quiz;
