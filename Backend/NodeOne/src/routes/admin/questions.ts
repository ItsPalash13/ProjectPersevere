import express from 'express';
import { Question } from '../../models/Questions';
import { QuestionTs } from '../../models/QuestionTs';
import { Chapter } from '../../models/Chapter';
import { Topic } from '../../models/Topic';
import mongoose from 'mongoose';

const router = express.Router();

// Multi-add questions endpoint
router.post('/multi-add', async (req, res) => {
  try {
    const { questions, chapterId, topicIds, xpCorrect, xpIncorrect } = req.body;

    // Validate required fields
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'Questions array is required and must not be empty' });
    }

    if (!chapterId) {
      return res.status(400).json({ error: 'Chapter ID is required' });
    }

    if (!topicIds || !Array.isArray(topicIds) || topicIds.length === 0) {
      return res.status(400).json({ error: 'Topic IDs array is required and must not be empty' });
    }

    if (typeof xpCorrect !== 'number' || typeof xpIncorrect !== 'number') {
      return res.status(400).json({ error: 'XP values must be numbers' });
    }

    // Validate chapter exists
    const chapter = await Chapter.findById(chapterId);
    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Validate topics exist and get their names
    const topics = await Topic.find({ _id: { $in: topicIds } });
    if (topics.length !== topicIds.length) {
      return res.status(404).json({ error: 'Some topics not found' });
    }

    const topicMap = topics.reduce((acc, topic) => {
      acc[String(topic._id)] = topic.topic;
      return acc;
    }, {} as Record<string, string>);

    const createdQuestions = [];
    const createdQuestionTs = [];

    // Process each question
    for (const questionData of questions) {
      if (!Array.isArray(questionData) || questionData.length < 8) {
        return res.status(400).json({ 
          error: `Invalid question format. Expected array with at least 8 elements: [question, option1, option2, option3, option4, correctIndex, mu, sigma]` 
        });
      }

      const [questionText, option1, option2, option3, option4, correctIndex, mu, sigma] = questionData;

      // Validate question data
      if (typeof questionText !== 'string' || questionText.trim() === '') {
        return res.status(400).json({ error: 'Question text is required' });
      }

      if (![option1, option2, option3, option4].every(opt => typeof opt === 'string' && opt.trim() !== '')) {
        return res.status(400).json({ error: 'All options must be non-empty strings' });
      }

      if (typeof correctIndex !== 'number' || correctIndex < 0 || correctIndex > 3) {
        return res.status(400).json({ error: 'Correct index must be 0, 1, 2, or 3' });
      }

      if (typeof mu !== 'number' || typeof sigma !== 'number') {
        return res.status(400).json({ error: 'Mu and sigma must be numbers' });
      }

      // Create question
      const question = new Question({
        ques: questionText.trim(),
        options: [option1.trim(), option2.trim(), option3.trim(), option4.trim()],
        correct: correctIndex,
        chapterId: new mongoose.Types.ObjectId(chapterId),
        topics: topicIds.map(id => ({
          id: new mongoose.Types.ObjectId(id),
          name: topicMap[id]
        }))
      });

      const savedQuestion = await question.save();
      createdQuestions.push(savedQuestion);

      // Create QuestionTs entry
      const questionTs = new QuestionTs({
        quesId: savedQuestion._id,
        difficulty: {
          mu: mu,
          sigma: sigma
        },
        xp: {
          correct: xpCorrect,
          incorrect: xpIncorrect
        }
      });

      const savedQuestionTs = await questionTs.save();
      createdQuestionTs.push(savedQuestionTs);
    }

    res.status(201).json({
      message: `Successfully created ${createdQuestions.length} questions`,
      questions: createdQuestions,
      questionTs: createdQuestionTs
    });

  } catch (error) {
    console.error('Error in multi-add questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all questions
router.get('/', async (req, res) => {
  try {
    const { chapterId, topicId } = req.query;

    let query: any = {};
    
    if (chapterId) {
      query.chapterId = chapterId;
    }

    if (topicId) {
      query['topics.id'] = topicId;
    }

    const questions = await Question.find(query)
      .populate('chapterId', 'name')
      .sort({ createdAt: -1 });

    // Get QuestionTs data for each question
    const questionIds = questions.map(q => q._id);
    const questionTsData = await QuestionTs.find({ quesId: { $in: questionIds } });
    
    // Create a map for quick lookup
    const questionTsMap = questionTsData.reduce((acc, qt) => {
      acc[String(qt.quesId)] = qt;
      return acc;
    }, {} as Record<string, any>);

    // Attach QuestionTs data to questions
    const questionsWithTs = questions.map(question => ({
      ...question.toObject(),
      questionTs: questionTsMap[String(question._id)]
    }));

    res.json({
      data: questionsWithTs
    });

  } catch (error) {
    console.error('Error fetching questions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get question by ID
router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('chapterId', 'name')
      .populate('topics.id', 'name');

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);

  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update question
router.put('/:id', async (req, res) => {
  try {
    const { ques, options, correct, chapterId, topics, xpCorrect, xpIncorrect, mu, sigma } = req.body;

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Update question
    if (ques) question.ques = ques;
    if (options) question.options = options;
    if (correct !== undefined) question.correct = correct;
    if (chapterId) question.chapterId = chapterId;
    if (topics) question.topics = topics;

    await question.save();

    // Update QuestionTs if difficulty or XP values provided
    if (mu !== undefined || sigma !== undefined || xpCorrect !== undefined || xpIncorrect !== undefined) {
      const questionTs = await QuestionTs.findOne({ quesId: question._id });
      
      if (questionTs) {
        if (mu !== undefined) questionTs.difficulty.mu = mu;
        if (sigma !== undefined) questionTs.difficulty.sigma = sigma;
        if (xpCorrect !== undefined) questionTs.xp.correct = xpCorrect;
        if (xpIncorrect !== undefined) questionTs.xp.incorrect = xpIncorrect;
        await questionTs.save();
      }
    }

    res.json(question);

  } catch (error) {
    console.error('Error updating question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete question
router.delete('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete associated QuestionTs
    await QuestionTs.deleteOne({ quesId: question._id });

    // Delete question
    await Question.findByIdAndDelete(req.params.id);

    res.json({ message: 'Question deleted successfully' });

  } catch (error) {
    console.error('Error deleting question:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
