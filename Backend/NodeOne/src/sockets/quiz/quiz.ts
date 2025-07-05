// DEPRECATED: This file has been split into quiz-session.ts and quiz-questions.ts
// This file is kept for reference and will be removed in future versions

import { quizSessionHandlers } from './quiz-session';
import { quizQuestionHandlers } from './quiz-questions';
import { Socket } from 'socket.io';

// Backward compatibility export - combines both handlers
export const quizSocketHandlers = (socket: Socket) => {
  quizSessionHandlers(socket);
  quizQuestionHandlers(socket);
};

export default null;
