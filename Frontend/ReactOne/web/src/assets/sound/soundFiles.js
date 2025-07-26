// Centralized sound file paths for quiz and other components

import correctSound from './correct_answer.mp3';
import incorrectSound from './wrong_answer.mp3';
import nextQuestionSound from './whoosh_short.mp3';
import countdownSound from './countdown.mp3';
import countdownEndSound from './countdown_end.mp3';
import levelWonSound from './level_won.mp3';
import achievementSound from './achievement1.mp3';



const SOUND_FILES = {
  CORRECT: correctSound,
  INCORRECT: incorrectSound,
  NEXT_QUESTION: nextQuestionSound,
  COUNTDOWN: countdownSound,
  COUNTDOWN_END: countdownEndSound,
  LEVEL_WON: levelWonSound,
  ACHIEVEMENT: achievementSound,
};

export default SOUND_FILES; 