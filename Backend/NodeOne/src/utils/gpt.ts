import OpenAI from "openai";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.GPT4 // Ensure this is set in your environment
});

interface LevelFeedbackParams {
  levelName: string;
  levelTopics: string[];
  studentXP: number;
  requiredXP: number;
  accuracy: number;
  timeTaken: string;
  levelResult: string;
  nextLevel: string;
  firstName: string;
  newHighScore?: boolean;
}

async function getShortLevelFeedback({ levelName, levelTopics, studentXP, requiredXP, accuracy, timeTaken, levelResult, nextLevel, firstName, newHighScore = false }: LevelFeedbackParams): Promise<string> {
  const userPrompt = `
You're a motivational AI tutor. Give a personalized end-of-level message in under 30 words based on the following:

Student: ${firstName}
Level: ${levelName}
Topics: ${levelTopics.join(", ")}
XP Earned: ${studentXP}
Required XP: ${requiredXP}
Accuracy: ${accuracy}%
Time: ${timeTaken}
Result: ${levelResult}
${newHighScore ? 'NEW HIGH SCORE ACHIEVED!' : ''}
Next: ${nextLevel}

${levelResult === 'completed' ? 
  'Make it short, supportive, and energizing. Use the student\'s first name and mention strengths briefly, and hype up the next level.' :
  'Make it encouraging and motivating. Use the student\'s first name, acknowledge their effort, and encourage them to try again. Mention how close they are to completing the level.'
}
${newHighScore ? 'If it\'s a new high score, make sure to celebrate that achievement!' : ''}
`;
  console.log("userPrompt",userPrompt);
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a concise and encouraging AI tutor." },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.6,
    max_tokens: 60 // Max ~30 words
  });

  return response.choices[0]?.message?.content?.trim() || "Great job! Keep up the excellent work!";
}

export { getShortLevelFeedback };
