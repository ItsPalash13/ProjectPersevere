    import express, { Request, Response, RequestHandler } from 'express';
    import { Level } from '../models/Level';
    import { Chapter } from '../models/Chapter';
    import { Unit } from '../models/Units';
    import { UserChapterLevel } from '../models/UserChapterLevel';
    import { UserChapterUnit } from '../models/UserChapterUnit';
    import { UserLevelSession } from '../models/UserLevelSession';
    import { UserLevelSessionTopicsLogs } from '../models/Performance/UserLevelSessionTopicsLogs';
    import { QuestionTs } from '../models/QuestionTs';
    import { Question } from '../models/Questions';
    import { UserProfile } from '../models/UserProfile';
    import authMiddleware from '../middleware/authMiddleware';
    import mongoose from 'mongoose';
    import { getSkewNormalRandom } from '../utils/math';
    import { Topic } from '../models/Topic';
    import { processBadgesAfterQuiz } from '../utils/badgeprocessor';

    // Function to create question bank based on level and attempt type using MU (difficulty)
    const createQuestionBankByMu = async (level: any, attemptType: string): Promise<any[]> => {
      try {
        // Generate difficulty using skew normal distribution
        const difficulty = getSkewNormalRandom(
          level.difficultyParams?.mean || 0,
          level.difficultyParams?.sd || 1,
          level.difficultyParams?.alpha || 0
        );

        // Determine number of questions for the session
        let numQuestions = 10;
        if (attemptType === 'precision_path') {
          numQuestions = level.precisionPath?.totalQuestions || 10;
        } else if (attemptType === 'time_rush') {
          numQuestions = level.timeRush?.totalQuestions || 10;
        }

        // Fetch topic IDs for the level's topic names
        const topicDocs = await Topic.find({ _id: { $in: level.topics } });
        const levelTopicIds = topicDocs.map((t: any) => t._id.toString());
        
        // Helper function to filter questions by topics
        const filterQuestionsByTopics = (questions: any[]): any[] => {
          return questions.filter(qt => {
            if (!qt.quesId || typeof qt.quesId !== 'object' || !('topics' in qt.quesId) || !Array.isArray(qt.quesId.topics) || !qt.quesId.topics.length) return false;
            const topicIds = qt.quesId.topics.map((t: any) => t.id.toString());
            return topicIds.length >= 1 && topicIds.every((id: string) => levelTopicIds.includes(id));
          });
        };

        // Get questions with difficulty >= generated
        const questionTsList = await QuestionTs.find({
          'difficulty.mu': { $gte: difficulty }
        })
        .populate('quesId')
        .sort({ 'difficulty.mu': 1 })
        .limit(numQuestions);

        let finalQuestionTsList = filterQuestionsByTopics(questionTsList);

        // If not enough questions found with difficulty >= generated, get questions with difficulty <= generated
        if (finalQuestionTsList.length < numQuestions) {
          const additionalQuestions = await QuestionTs.find({
            'difficulty.mu': { $lte: difficulty }
          })
          .populate('quesId')
          .sort({ 'difficulty.mu': -1 })
          .limit(numQuestions - finalQuestionTsList.length);
          
          const filteredAdditional = filterQuestionsByTopics(additionalQuestions);
          finalQuestionTsList.push(...filteredAdditional);
        }

        // If still not enough, relax difficulty (only topic filter)
        if (finalQuestionTsList.length < numQuestions) {
          const moreByTopic = await QuestionTs.find({})
            .populate('quesId')
            .sort({ 'difficulty.mu': 1 })
            .limit(numQuestions - finalQuestionTsList.length);
          
          const filteredMoreByTopic = filterQuestionsByTopics(moreByTopic);
          finalQuestionTsList.push(...filteredMoreByTopic);
        }

        // If still not enough, fill with any random questions
        if (finalQuestionTsList.length < numQuestions) {
          const randomQuestions = await QuestionTs.aggregate([
            { $sample: { size: numQuestions - finalQuestionTsList.length } },
            { $lookup: { from: 'questions', localField: 'quesId', foreignField: '_id', as: 'quesObj' } },
            { $unwind: '$quesObj' }
          ]);
          randomQuestions.forEach(q => { q.quesId = q.quesObj; });
          finalQuestionTsList.push(...randomQuestions);
        }

        // Truncate to numQuestions if overfilled
        finalQuestionTsList = finalQuestionTsList.slice(0, numQuestions);

        if (!finalQuestionTsList.length) {
          throw new Error('No suitable questions found');
        }

        // Extract question IDs for the question bank
        return finalQuestionTsList.map(qt => qt.quesId);
      } catch (error) {
        console.error('Error creating question bank by MU:', error);
        throw error;
      }
    };

    // Function to create question bank based on level's unitId
    const createQuestionBankByUnit = async (level: any, attemptType: string): Promise<any[]> => {
      try {
        // Determine number of questions for the session
        let numQuestions = 10;
        if (attemptType === 'precision_path') {
          numQuestions = level.precisionPath?.totalQuestions || 10;
        } else if (attemptType === 'time_rush') {
          numQuestions = level.timeRush?.totalQuestions || 10;
        }

        
        const questions = await Question.find({
          unitId: level.unitId,
          "topics": {
            $not: {
              $elemMatch: {
                id: { $nin: level.topics }
              }
            }
          }
        }).populate('topics.id').limit(numQuestions * 3); // Get more questions to filter from


        if (!questions.length) {
          throw new Error('No questions found for this unit with the required topics');
        }

        // Shuffle and take random questions from unit
        const shuffledUnitQuestions = questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);
        let finalQuestions = [...shuffledUnitQuestions];


        // If still not enough, get random questions from all questions
        if (finalQuestions.length < numQuestions) {
          const randomQuestions = await Question.aggregate([
            { $sample: { size: (numQuestions - finalQuestions.length) * 2 } },
            { $lookup: { from: 'topics', localField: 'topics.id', foreignField: '_id', as: 'topics' } }
          ]);
          
          // Shuffle and add random questions
          const shuffledRandomQuestions = randomQuestions.sort(() => Math.random() - 0.5);
          finalQuestions.push(...shuffledRandomQuestions.slice(0, numQuestions - finalQuestions.length));
        }

        // Final shuffle of all selected questions
        finalQuestions = finalQuestions.sort(() => Math.random() - 0.5);

        // Truncate to numQuestions if overfilled
        finalQuestions = finalQuestions.slice(0, numQuestions);
        


        if (!finalQuestions.length) {
          throw new Error('No suitable questions found for this unit');
        }

        return finalQuestions;
      } catch (error) {
        console.error('Error creating question bank by Unit:', error);
        throw error;
      }
    };

    // Main function to create question bank based on environment variable
    const createQuestionBank = async (level: any, attemptType: string): Promise<any[]> => {
      const questionFetchStrategy = process.env.QUESTION_FETCH || '0';
      
      if (questionFetchStrategy === '1') {
        console.log('Using Unit-based question fetching strategy');
        return await createQuestionBankByUnit(level, attemptType);
      } else {
        console.log('Using MU-based question fetching strategy');
        return await createQuestionBankByMu(level, attemptType);
      }
    };

    // Helper function to calculate percentile for Time Rush (maxTime - best remaining time)
    const calculateTimeRushPercentile = async (chapterId: string, levelId: string, userMaxTime: number, userId: string): Promise<{ percentile: number, participantCount: number }> => {
      try {
        // Get all completed Time Rush attempts for this level, excluding current user
        const allTimes = await UserChapterLevel.find({
          chapterId,
          levelId,
          attemptType: 'time_rush',
          userId: { $ne: userId }, // Exclude current user
          'timeRush.minTime': { $exists: true, $nin: [null, Infinity] }
        }).select('timeRush.minTime');

        if (allTimes.length === 0) return { percentile: 100, participantCount: 0 }; // Only user who completed this level

        // Extract minTime values (which stores maxTime for Time Rush) and filter out null/undefined/Infinity
        const maxTimeValues = allTimes
          .map(time => time.timeRush?.minTime)
          .filter(time => time !== null && time !== undefined && time !== Infinity) as number[];

        if (maxTimeValues.length === 0) return { percentile: 100, participantCount: 0 };

        // Count how many users have lower maxTime (completed with less time remaining) than current user
        const usersWithLowerTime = maxTimeValues.filter(time => time < userMaxTime).length;
        
        // Calculate percentile (percentage of users with worse time)
        const percentile = Math.round((usersWithLowerTime / maxTimeValues.length) * 100);
        
        return { percentile, participantCount: maxTimeValues.length };
      } catch (error) {
        console.error('Error calculating Time Rush percentile:', error);
        return { percentile: 0, participantCount: 0 }; // Return 0 on error
      }
    };

    // Helper function to calculate percentile for Precision Path (minTime)
    const calculatePrecisionPathPercentile = async (chapterId: string, levelId: string, userMinTime: number, userId: string): Promise<{ percentile: number, participantCount: number }> => {
      try {
        // Get all completed Precision Path attempts for this level, excluding current user
        const allTimes = await UserChapterLevel.find({
          chapterId,
          levelId,
          attemptType: 'precision_path',
          userId: { $ne: userId }, // Exclude current user
          'precisionPath.minTime': { $exists: true, $nin: [null, Infinity] }
        }).select('precisionPath.minTime');

        if (allTimes.length === 0) return { percentile: 100, participantCount: 0 }; // Only user who completed this level

        // Extract minTime values and filter out null/undefined/Infinity
        const minTimeValues = allTimes
          .map(time => time.precisionPath?.minTime)
          .filter(time => time !== null && time !== undefined && time !== Infinity) as number[];

        if (minTimeValues.length === 0) return { percentile: 100, participantCount: 0 };

        // Count how many users have higher minTime (slower) than current user
        const usersWithHigherTime = minTimeValues.filter(time => time > userMinTime).length;
        
        // Calculate percentile (percentage of users with slower time)
        const percentile = Math.round((usersWithHigherTime / minTimeValues.length) * 100);
        
        return { percentile, participantCount: minTimeValues.length };
      } catch (error) {
        console.error('Error calculating Precision Path percentile:', error);
        return { percentile: 0, participantCount: 0 }; // Return 0 on error
      }
    };

    interface AuthRequest extends Request {
      user: {
        id: string;
      };
    }


    const router = express.Router();

    // Start a level
    router.post('/start', authMiddleware, (async (req: AuthRequest, res: Response) => {
      try {
        const { levelId, attemptType } = req.body;
        const userId = req.user.id;

        if (!attemptType || !['time_rush', 'precision_path'].includes(attemptType)) {
          return res.status(400).json({
            success: false,
            error: 'Invalid attempt type. Must be either time_rush or precision_path'
          });
        }

        // Find the level
        const level = await Level.findById(levelId);
        if (!level) {
          return res.status(404).json({
            success: false,
            error: 'Level not found'
          });
        }

        // Validate that the attemptType matches the level's supported type
        if (level.type !== attemptType) {
          return res.status(400).json({
            success: false,
            error: `This level does not support ${attemptType} mode. It only supports ${level.type} mode.`
          });
        }

        // Check user's health before allowing to start level
        const userProfile = await UserProfile.findOne({ userId });
        if (!userProfile) {
          return res.status(404).json({
            success: false,
            error: 'User profile not found'
          });
        }

        if (userProfile.health <= 0) {
          return res.status(403).json({
            success: false,
            error: 'Insufficient health to start level. You need health greater than 0 to play.'
          });
        }

        // Check if UserChapterUnit exists, create if not found
        await UserChapterUnit.findOneAndUpdate(
          {
            userId,
            chapterId: level.chapterId,
            unitId: level.unitId
          },
          {
            $setOnInsert: {
              status: 'in_progress',
              startedAt: new Date()
            }
          },
          {
            upsert: true,
            new: true
          }
        );
        
        // Deduct 1 health when starting a level (never go below 0)
        await UserProfile.findOneAndUpdate(
          { userId },
          { $inc: { health: -1 } },
          { upsert: true }
        );
        
        // Ensure health doesn't go below 0
        await UserProfile.findOneAndUpdate(
          { userId, health: { $lt: 0 } },
          { $set: { health: 0 } }
        );

        // Find existing UserChapterLevel
        let userChapterLevel = await UserChapterLevel.findOne({
          userId,
          levelId,
          chapterId: level.chapterId,
          attemptType
        });

        // Prepare update object
        const updateObj: any = {
          $set: {
            lastAttemptedAt: new Date()
          }
        };

        // Handle attempts differently for new vs existing documents
        if (!userChapterLevel) {
          // New document - set attempts to 1 and initialize the mode-specific object
          const fieldName = attemptType === 'time_rush' ? 'timeRush' : 'precisionPath';
          updateObj.$set[fieldName] = {
            attempts: 1,
            requiredXp: attemptType === 'time_rush' ? (level.timeRush?.requiredXp || 0) : (level.precisionPath?.requiredXp || 0),
            ...(attemptType === 'time_rush' ? {
              minTime: 0, // For Time Rush, this stores maxTime (best remaining time)
              timeLimit: level.timeRush?.totalTime || 0,
              totalQuestions: level.timeRush?.totalQuestions || 10
            } : {
              minTime: null
            })
          };
          updateObj.$set.status = 'in_progress';
        } else {
          // Existing document - update the entire mode-specific object with incremented attempts
          const fieldName = attemptType === 'time_rush' ? 'timeRush' : 'precisionPath';
          const currentAttempts = (userChapterLevel as any)[fieldName]?.attempts || 0;
          const newAttempts = currentAttempts + 1;
          
          // Set the entire object to ensure proper update
          updateObj.$set[fieldName] = {
            ...(userChapterLevel as any)[fieldName],
            attempts: newAttempts
          };
          
          // Only update status to 'in_progress' if it's currently 'not_started'
          if (userChapterLevel.status === 'not_started') {
            updateObj.$set.status = 'in_progress';
          }
        }

        // Update or create UserChapterLevel
        userChapterLevel = await UserChapterLevel.findOneAndUpdate({
          userId,
          levelId,
          chapterId: level.chapterId,
          attemptType
        }, updateObj, {
          new: true, // Return the updated document
          upsert: true // Create if doesn't exist
        });

        // Delete all existing sessions for this userChapterLevelId
        if (userChapterLevel) {
          await UserLevelSession.deleteMany({
            userChapterLevelId: userChapterLevel._id
          });
        }

        // Create question bank using the helper function
        const questionBank = await createQuestionBank(level, attemptType);

        // Create new session with question bank
        const session = await UserLevelSession.create({
          userChapterLevelId: userChapterLevel?._id,
          userId,
          chapterId: level.chapterId,
          levelId: level._id,
          attemptType,
          status: 0,
          currentQuestion: questionBank[0], // Set first question as current
          currentQuestionIndex: 0,
          questionBank,
          questionsAnswered: {
            correct: [],
            incorrect: []
          },
          ...(attemptType === 'time_rush' ? {
            timeRush: {
              requiredXp: level.timeRush?.requiredXp || 0,
              currentXp: 0,
              minTime: userChapterLevel?.timeRush?.minTime || 0, // For Time Rush, this stores maxTime
              timeLimit: level.timeRush?.totalTime || 0,
              currentTime: level.timeRush?.totalTime || 0,
              totalQuestions: level.timeRush?.totalQuestions || 10
            }
          } : {
            precisionPath: {
              requiredXp: level.precisionPath?.requiredXp || 0,
              currentXp: 0,
              currentTime: 0,
              minTime: userChapterLevel?.precisionPath?.minTime || Infinity,
              totalQuestions: level.precisionPath?.totalQuestions || 10
            }
          })
        });

        // Get the first question details
        const firstQuestion = await Question.findById(questionBank[0]);
        if (!firstQuestion) {
          throw new Error('Question not found');
        }
        // Extract topic names for the first question
        const firstQuestionTopics = firstQuestion.topics?.map(t => t.name) || [];

        return res.status(201).json({
          success: true,
          data: {
            session,
            currentQuestion: {
              question: firstQuestion.ques,
              options: firstQuestion.options,
              correctAnswer: firstQuestion.correct,
              topics: firstQuestionTopics
            },
            totalQuestions: questionBank.length
          }
        });
      } catch (error) {
        console.error('Error starting level:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Server Error'
        });
      }
    }) as unknown as RequestHandler);

    // Get levels by chapter ID
    router.get('/:chapterId', authMiddleware, (async (req: AuthRequest, res: Response) => {
      try {
        const { chapterId } = req.params;
        const userId = req.user.id;
        
        // Fetch chapter
        const chapter = await Chapter.findById(chapterId)
          .select('name description gameName status thumbnailUrl');

        if (!chapter) {
          return res.status(404).json({
            success: false,
            error: 'Chapter not found'
          });
        }

        // Get topics for this chapter
        const chapterTopics = await Topic.find({ chapterId: chapterId }).select('topic');
        const chapterTopicNames = chapterTopics.map(topic => topic.topic);

        // Get all units for this chapter (not just those the user has access to)
        const chapterUnits = await Unit.find({
          chapterId: new mongoose.Types.ObjectId(chapterId)
        }).select('_id name description status topics');

        // Fetch all topic names for these units in one go
        const allTopicIds = Array.from(new Set(chapterUnits.flatMap(unit => unit.topics.map(tid => tid.toString()))));
        const unitTopics = await Topic.find({ _id: { $in: allTopicIds } }).select('_id topic');
        const topicIdToName = new Map(unitTopics.map((t: any) => [t._id.toString(), t.topic]));

        // Get all UserChapterUnit for this user/chapter
        const userChapterUnits = await UserChapterUnit.find({
          userId: new mongoose.Types.ObjectId(userId),
          chapterId: new mongoose.Types.ObjectId(chapterId)
        });
        const userUnitIds = new Set(userChapterUnits.map(ucu => ucu.unitId.toString()));

        // Map units to include topic names and locked property
        const unitsWithTopicNames = chapterUnits.map(unit => ({
          _id: unit._id,
          name: unit.name,
          description: unit.description,
          status: unit.status,
          topics: unit.topics.map(tid => topicIdToName.get(tid.toString()) || tid.toString()),
          locked: !userUnitIds.has((unit._id as any).toString())
        }));

        // Get all levels for these units (not just those the user has access to)
        const allUnitIds = chapterUnits.map(unit => unit._id);
        const levels = await Level.find({ 
          chapterId,
          unitId: { $in: allUnitIds }
        })
          .select('name levelNumber description type timeRush precisionPath topics status unitId')
          .populate('topics', 'topic') // Populate topics with their names
          .sort({ levelNumber: 1 })
          .lean() as any[];

        // Get all UserChapterLevel for this user/chapter/levels
        const userProgress = await UserChapterLevel.find({
          userId: new mongoose.Types.ObjectId(userId),
          chapterId: new mongoose.Types.ObjectId(chapterId),
          levelId: { $in: levels.map(level => new mongoose.Types.ObjectId(level._id)) }
        });
        const progressMap = new Map(
          userProgress.map(progress => [`${progress.levelId.toString()}_${progress.attemptType}`, progress])
        );

        // Process levels: add locked property if no UCL for this user/level/type
        const mixedLevels = await Promise.all(levels.map(async (level) => {
          const progressKey = `${level._id.toString()}_${level.type}`;
          const hasProgress = progressMap.has(progressKey);
          const rawProgress = progressMap.get(progressKey);
          // Clean user progress to only include relevant fields for the level's type
          let cleanProgress = null;
          if (rawProgress) {
            cleanProgress = {
              ...rawProgress.toObject(),
              ...(level.type === 'time_rush' ? { precisionPath: undefined } : { timeRush: undefined }),
              ...(level.type === 'precision_path' && level.precisionPath?.totalQuestions ? {
                precisionPath: {
                  ...rawProgress.toObject().precisionPath,
                  totalQuestions: level.precisionPath.totalQuestions
                }
              } : {})
            };
          }
          
          // Calculate percentile for this level
          let percentile = null;
          let participantCount = null;
          if (rawProgress) {
            if (level.type === 'time_rush' && rawProgress.timeRush?.minTime && rawProgress.timeRush.minTime > 0) {
              const result = await calculateTimeRushPercentile(
                chapterId,
                level._id.toString(),
                rawProgress.timeRush.minTime, // This stores maxTime for Time Rush
                userId
              );
              percentile = result.percentile;
              participantCount = result.participantCount;
            } else if (level.type === 'precision_path' && rawProgress.precisionPath?.minTime && rawProgress.precisionPath.minTime !== Infinity) {
              const result = await calculatePrecisionPathPercentile(
                chapterId,
                level._id.toString(),
                rawProgress.precisionPath.minTime,
                userId
              );
              percentile = result.percentile;
              participantCount = result.participantCount;
            }
          }
          
          // Level is locked if user does not have UCL for this level/type
          const locked = !hasProgress;
                      return {
              ...level,
              userProgress: cleanProgress,
              isStarted: hasProgress,
              status: level.status && hasProgress, // keep status logic for backward compat
              mode: level.type,
              locked,
              progress: rawProgress?.progress || 0, // Include progress field from UserChapterLevel
              percentile: percentile, // Include percentile ranking
              participantCount: participantCount // Include participant count
            };
        }));

        return res.status(200).json({
          success: true,
          count: {
            total: mixedLevels.length,
            timeRush: mixedLevels.filter(level => level.type === 'time_rush').length,
            precisionPath: mixedLevels.filter(level => level.type === 'precision_path').length
          },
          meta: {
            chapter: {
              ...chapter.toObject(),
              topics: chapterTopicNames
            },
            units: unitsWithTopicNames
          },
          data: mixedLevels
        });
      } catch (error) {
        console.error('Error fetching levels:', error);
        return res.status(500).json({
          success: false,
          error: 'Server Error'
        });
      }
    }) as unknown as RequestHandler);

    // End a level
    router.post('/end', (async (req: Request, res: Response) => {
      try {
        const { userLevelSessionId, userId, currentTime } = req.body;
        
        if (!userId || !userLevelSessionId) {
          return res.status(400).json({
            success: false,
            error: 'userId and userLevelSessionId are required'
          });
        }

        // Find the session
        const session = await UserLevelSession.findById(userLevelSessionId);
        if (!session) {
          return res.status(404).json({
            success: false,
            error: 'Session not found'
          });
        }

        // Get current UserChapterLevel
        const userChapterLevel = await UserChapterLevel.findOne({
          userId,
          chapterId: session.chapterId,
          levelId: session.levelId,
          attemptType: session.attemptType
        });

         // Before processing badges, merge uniqueTopics from session into user profile
         if (session.uniqueTopics && Array.isArray(session.uniqueTopics)) {
          const userProfile = await UserProfile.findOne({ userId });
          if (userProfile) {
            const profileTopics = (userProfile.uniqueTopics || []).map((t: any) => t.toString());
            const sessionTopics = session.uniqueTopics.map((t: any) => t.toString());
            const allTopicsSet = new Set([...profileTopics, ...sessionTopics]);
            userProfile.uniqueTopics = Array.from(allTopicsSet);
            await userProfile.save();
          }
        }


        // Phase 2: Set status to 1 for all session topic logs for this session TODAY
        try {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          await UserLevelSessionTopicsLogs.updateMany(
            { 
              userChapterLevelId: session.userChapterLevelId,
              userLevelSessionId: userLevelSessionId,
              createdAt: { 
                $gte: today, 
                $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) 
              }
            },
            { 
              $set: { status: 1 } 
            }
          );
          
        } catch (sessionLogError) {
          console.error('Error updating session topic logs status:', sessionLogError);
          // Don't break the level end flow if session logging fails
        }

        let highScoreMessage = '';
        let newHighScore = false;

        if (session.attemptType === 'time_rush') {
          // Time Rush: Check if current time (remaining) is better than stored maxTime
          const finalTime = currentTime || session.timeRush?.currentTime || 0;
          const maxTime = userChapterLevel?.timeRush?.minTime || 0; // This field stores maxTime for Time Rush
          const currentXp = session.timeRush?.currentXp || 0;
          
          if (finalTime > maxTime && currentXp >= (session.timeRush?.requiredXp || 0)) {
            newHighScore = true;
            let totalMilliseconds = Math.floor(finalTime * 1000); // convert to ms
            let minutes = Math.floor(totalMilliseconds / 60000);
            let seconds = Math.floor((totalMilliseconds % 60000) / 1000);
            let milliseconds = totalMilliseconds % 1000;

            let formatted = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
            highScoreMessage = `New best time: ${formatted} remaining!`;
          }

          // Check if user has enough XP
          if (currentXp >= (session.timeRush?.requiredXp || 0)) {
            // Find the current level
            const currentLevel = await Level.findById(session.levelId);
            if (!currentLevel) {
              throw new Error('Level not found');
            }

            // Find the next level in the same chapter with the same type
            const nextLevel = await Level.findOne({
              chapterId: session.chapterId,
              levelNumber: currentLevel.levelNumber + 1
            }).select('_id levelNumber type');

            // Calculate progress: min(required score, current level scored) / required score * 100
            const requiredXp = session.timeRush?.requiredXp || 0;
            const achievedXp = Math.min(currentXp, requiredXp);
            const calculatedProgress = requiredXp > 0 ? Math.round((achievedXp / requiredXp) * 100) : 0;
            const currentProgress = userChapterLevel?.progress || 0;
            const progress = Math.max(calculatedProgress, currentProgress);

            // Update UserChapterLevel for current level
            await UserChapterLevel.findOneAndUpdate(
              {
                userId,
                chapterId: session.chapterId,
                levelId: session.levelId,
                attemptType: 'time_rush'
              },
              {
                $set: {
                  status: 'completed',
                  completedAt: new Date(),
                  'timeRush.minTime': Math.max(finalTime, maxTime), // Store the maximum time remaining
                  progress: progress
                }
              },
              { upsert: true }
            );
            const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/'); // YYYY/MM
            // Update user's totalCoins and health when level is completed
            await UserProfile.findOneAndUpdate(
              { userId },
              { 
                $inc: { 
                  totalCoins: currentXp, 
                  health: 1,
                  [`monthlyXp.${currentMonth}`]: currentXp
                }
              },
              { upsert: true }
            );           
            // Ensure health doesn't exceed 6
            await UserProfile.findOneAndUpdate(
              { userId, health: { $gt: 6 } },
              { $set: { health: 6 } }
            );

            // If next level exists, check if UserChapterLevel already exists for it
            if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
              const existingNextLevel = await UserChapterLevel.findOne({
                userId,
                chapterId: session.chapterId,
                levelId: nextLevel._id,
                attemptType: nextLevel.type
              });

              // Only create if it doesn't exist
              if (!existingNextLevel) {
                await UserChapterLevel.create({
                  userId,
                  chapterId: session.chapterId,
                  levelId: nextLevel._id,
                  attemptType: nextLevel.type,
                  status: 'not_started',
                  levelNumber: nextLevel.levelNumber,
                  // Set mode-specific fields based on next level's type
                  ...(nextLevel.type === 'time_rush' ? {
                    timeRush: {
                      minTime: null,
                      attempts: 0,
                      requiredXp: nextLevel.timeRush?.requiredXp || 0,
                      timeLimit: nextLevel.timeRush?.totalTime || 0,
                      totalQuestions: nextLevel.timeRush?.totalQuestions || 10
                    }
                  } : {
                    precisionPath: {
                      minTime: null,
                      attempts: 0,
                      requiredXp: nextLevel.precisionPath?.requiredXp || 0
                    }
                  })
                });
              }
            }

            // Calculate percentile based on maxTime
            const percentileResult = await calculateTimeRushPercentile(
              session.chapterId.toString(),
              session.levelId.toString(),
              Math.max(finalTime, maxTime),
              userId
            );
            const percentile = percentileResult.percentile;

            // Now process badges
            await processBadgesAfterQuiz(userLevelSessionId);

            // Delete the session
            await UserLevelSession.findByIdAndDelete(userLevelSessionId);

            return res.status(200).json({
              success: true,
              message: highScoreMessage ? 
                `Level completed successfully! You have unlocked the next level. ${highScoreMessage}` :
                'Level completed successfully! You have unlocked the next level.',
              data: {
                currentXp,
                requiredXp: session.timeRush?.requiredXp,
                minTime: Math.max(finalTime, maxTime), // Best time remaining
                timeTaken: finalTime,
                hasNextLevel: !!nextLevel,
                nextLevelNumber: nextLevel?.levelNumber,
                nextLevelId: nextLevel?._id,
                nextLevelAttemptType: nextLevel?.type,
                isNewHighScore: newHighScore,
                percentile
              }
            });
          } else {
            // Calculate progress: min(required score, current level scored) / required score * 100
            const requiredXp = session.timeRush?.requiredXp || 0;
            const achievedXp = Math.min(currentXp, requiredXp);
            const calculatedProgress = requiredXp > 0 ? Math.round((achievedXp / requiredXp) * 100) : 0;
            const currentProgress = userChapterLevel?.progress || 0;
            const progress = Math.max(calculatedProgress, currentProgress);

            // Update progress even if level not completed (don't update best time)
            await UserChapterLevel.findOneAndUpdate(
              {
                userId,
                chapterId: session.chapterId,
                levelId: session.levelId,
                attemptType: 'time_rush'
              },
              {
                $set: {
                  progress: progress
                }
              },
              { upsert: true }
            );

            // Calculate percentile based on current best time (if available)
            const percentile = maxTime > 0 ? (await calculateTimeRushPercentile(
              session.chapterId.toString(),
              session.levelId.toString(),
              maxTime,
              userId
            )).percentile : 0;

            // Before deleting the session, process badges
            await processBadgesAfterQuiz(userLevelSessionId);

            // Delete the session
            await UserLevelSession.findByIdAndDelete(userLevelSessionId);
            console.log("Check ",newHighScore);
            return res.status(200).json({
              success: true,
              message: highScoreMessage ? 
                `Level ended. You need more XP to complete this level. ${highScoreMessage}` :
                'Level ended. You need more XP to complete this level.',
              data: {
                currentXp,
                requiredXp: session.timeRush?.requiredXp,
                minTime: maxTime, // Best time remaining
                timeTaken: finalTime,
                xpNeeded: (session.timeRush?.requiredXp || 0) - currentXp,
                hasNextLevel: false,
                nextLevelNumber: null,
                nextLevelId: null,
                nextLevelAttemptType: null,
                isNewHighScore: newHighScore,
                percentile
              }
            });
          }
        } else {
          // Precision Path: Check if current time is better than min time
          const finalTime = currentTime || session.precisionPath?.currentTime || 0;
          const minTime = userChapterLevel?.precisionPath?.minTime || Infinity;
          const currentXp = session.precisionPath?.currentXp || 0;
          
          // Check if user has enough XP
          if (currentXp >= (session.precisionPath?.requiredXp || 0)) {
            // Level completed - check and update best time
            if (finalTime < minTime) {
              newHighScore = true;
              let totalMilliseconds = Math.floor(finalTime * 1000); // convert to ms
              let minutes = Math.floor(totalMilliseconds / 60000);
              let seconds = Math.floor((totalMilliseconds % 60000) / 1000);
              let milliseconds = totalMilliseconds % 1000;

              let formatted = `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
              highScoreMessage = `New best time: ${formatted}!`;
            }

            // Find the current level
            const currentLevel = await Level.findById(session.levelId);
            if (!currentLevel) {
              throw new Error('Level not found');
            }

            // Find the next level in the same chapter with the same type
            const nextLevel = await Level.findOne({
              chapterId: session.chapterId,
              levelNumber: currentLevel.levelNumber + 1
            }).select('_id levelNumber type');

            // Calculate progress: min(required score, current level scored) / required score * 100
            const requiredXp = session.precisionPath?.requiredXp || 0;
            const achievedXp = Math.min(currentXp, requiredXp);
            const calculatedProgress = requiredXp > 0 ? Math.round((achievedXp / requiredXp) * 100) : 0;
            const currentProgress = userChapterLevel?.progress || 0;
            const progress = Math.max(calculatedProgress, currentProgress);

            // Update UserChapterLevel for current level
            await UserChapterLevel.findOneAndUpdate(
              {
                userId,
                chapterId: session.chapterId,
                levelId: session.levelId,
                attemptType: 'precision_path'
              },
              {
                $set: {
                  status: 'completed',
                  completedAt: new Date(),
                  'precisionPath.minTime': Math.min(finalTime, minTime),
                  progress: progress
                }
              },
              { upsert: true }
            );

            // Update user's totalCoins and health when level is completed
            //check if todays date is 1 more than last attempt date 
            const currentMonth = new Date().toISOString().slice(0, 7).replace('-', '/'); // YYYY/MM
            await UserProfile.findOneAndUpdate(
              { userId },
              { 
                $inc: { 
                  totalCoins: currentXp, 
                  health: 1,
                  [`monthlyXp.${currentMonth}`]: currentXp
                }
              },
              { upsert: true }
            );
            
            // Ensure health doesn't exceed 6
            await UserProfile.findOneAndUpdate(
              { userId, health: { $gt: 6 } },
              { $set: { health: 6 } }
            );

            // If next level exists, check if UserChapterLevel already exists for it
            if (nextLevel && typeof nextLevel.levelNumber === 'number' && !isNaN(nextLevel.levelNumber)) {
              const existingNextLevel = await UserChapterLevel.findOne({
                userId,
                chapterId: session.chapterId,
                levelId: nextLevel._id,
                attemptType: nextLevel.type
              });

              // Only create if it doesn't exist
              if (!existingNextLevel) {
                await UserChapterLevel.create({
                  userId,
                  chapterId: session.chapterId,
                  levelId: nextLevel._id,
                  attemptType: nextLevel.type,
                  status: 'not_started',
                  levelNumber: nextLevel.levelNumber,
                  // Set mode-specific fields based on next level's type
                  ...(nextLevel.type === 'time_rush' ? {
                    timeRush: {
                      minTime: null,
                      attempts: 0,
                      requiredXp: nextLevel.timeRush?.requiredXp || 0,
                      timeLimit: nextLevel.timeRush?.totalTime || 0
                    }
                  } : {
                    precisionPath: {
                      minTime: null,
                      attempts: 0,
                      requiredXp: nextLevel.precisionPath?.requiredXp || 0
                    }
                  })
                });
              }
            }

            // Calculate percentile based on minTime
            const percentileResult = await calculatePrecisionPathPercentile(
              session.chapterId.toString(),
              session.levelId.toString(),
              Math.min(finalTime, minTime),
              userId
            );
            const percentile = percentileResult.percentile;

            // Before deleting the session, process badges
            await processBadgesAfterQuiz(userLevelSessionId);

            // Delete the session
            await UserLevelSession.findByIdAndDelete(userLevelSessionId);

            return res.status(200).json({
              success: true,
              message: highScoreMessage ? 
                `Level completed successfully! You have unlocked the next level. ${highScoreMessage}` :
                'Level completed successfully! You have unlocked the next level.',
              data: {
                currentXp,
                requiredXp: session.precisionPath?.requiredXp,
                timeTaken: finalTime,
                bestTime: Math.min(finalTime, minTime),
                hasNextLevel: !!nextLevel,
                nextLevelNumber: nextLevel?.levelNumber,
                nextLevelId: nextLevel?._id,
                nextLevelAttemptType: nextLevel?.type,
                isNewHighScore: newHighScore,
                percentile
              }
            });
          } else {
            // Calculate progress: min(required score, current level scored) / required score * 100
            const requiredXp = session.precisionPath?.requiredXp || 0;
            const achievedXp = Math.min(currentXp, requiredXp);
            const calculatedProgress = requiredXp > 0 ? Math.round((achievedXp / requiredXp) * 100) : 0;
            const currentProgress = userChapterLevel?.progress || 0;
            const progress = Math.max(calculatedProgress, currentProgress);

            // Update progress even if level not completed
            await UserChapterLevel.findOneAndUpdate(
              {
                userId,
                chapterId: session.chapterId,
                levelId: session.levelId,
                attemptType: 'precision_path'
              },
              {
                $set: {
                  progress: progress
                }
              },
              { upsert: true }
            );

            // Level not completed - don't update best time
            // Calculate percentile based on current best time (if available)
            const percentile = minTime !== Infinity ? (await calculatePrecisionPathPercentile(
              session.chapterId.toString(),
              session.levelId.toString(),
              minTime,
              userId
            )).percentile : 0;

            // Before deleting the session, process badges
            await processBadgesAfterQuiz(userLevelSessionId);

            // Delete the session
            await UserLevelSession.findByIdAndDelete(userLevelSessionId);

            return res.status(200).json({
              success: true,
              message: 'Level ended. You need more XP to complete this level.',
              data: {
                currentXp,
                requiredXp: session.precisionPath?.requiredXp,
                timeTaken: finalTime,
                bestTime: minTime,
                xpNeeded: (session.precisionPath?.requiredXp || 0) - currentXp,
                hasNextLevel: false,
                nextLevelNumber: null,
                nextLevelId: null,
                nextLevelAttemptType: null,
                percentile
              }
            });
          }
        }
      } catch (error) {
        console.error('Error ending level:', error);
        return res.status(500).json({
          success: false,
          error: error.message || 'Server Error'
        });
      }
    }) as unknown as RequestHandler);

    export default router; 