import { UserLevelSession } from '../models/UserLevelSession';
import { UserProfile, UserProfileDocument } from '../models/UserProfile';
import Badge from '../models/Badge';

interface UserProfileWithStreak extends UserProfileDocument {
  lastAttemptDate: Date | null;
  dailyAttemptsStreak: number;
}

/**
 * Process the Daily Streak badge for a user after quiz completion.
 * @param userProfile UserProfileDocument (already fetched and up-to-date)
 * @param badge Daily Streak badge document (with badgelevel milestones)
 * @param quizDate Date when the quiz was completed (should be today)
 * @param userLevelSessionId Session ID to tag the badge award
 * @returns Promise<boolean> true if badge was awarded/updated, false otherwise
 */
export async function processDailyStreakBadge(userProfile: UserProfileDocument, badge: any, quizDate: Date, userLevelSessionId: string): Promise<boolean> {
  const profile = userProfile as UserProfileWithStreak;
  let updated = false;
  const lastDate = profile.lastAttemptDate ? new Date(profile.lastAttemptDate) : null;
  const today = new Date(quizDate);
  // Normalize both dates to UTC midnight
  if (lastDate) lastDate.setUTCHours(0,0,0,0);
  today.setUTCHours(0,0,0,0);
  console.log('[BadgeProcessor] quizDate:', quizDate, 'lastDate (UTC):', lastDate, 'today (UTC):', today);

  console.log('[BadgeProcessor] --- Daily Streak Badge Processing ---');
  console.log('[BadgeProcessor] User:', profile.userId);
  console.log('[BadgeProcessor] Previous lastAttemptDate:', profile.lastAttemptDate);
  console.log('[BadgeProcessor] Today:', today);
  console.log('[BadgeProcessor] Previous dailyAttemptsStreak:', profile.dailyAttemptsStreak);

  let streakChanged = false;
  if (lastDate) {
    // For testing: use only the day difference, ignoring time and month/year
    const diffDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    console.log('[BadgeProcessor] diffDays (testing, date only):', diffDays);
    if (diffDays === 1) {
      profile.dailyAttemptsStreak += 1;
      streakChanged = true;
      console.log('[BadgeProcessor] Streak incremented to:', profile.dailyAttemptsStreak);
    } else if (diffDays === 0) {
      // Same day - check if this is the first attempt of the day
      if (profile.dailyAttemptsStreak === 0) {
        // First attempt of the day, start streak
        profile.dailyAttemptsStreak = 1;
        streakChanged = true;
        console.log('[BadgeProcessor] First attempt of the day, streak set to 1');
      } else {
        // Already played today, do nothing
        console.log('[BadgeProcessor] Daily Streak: Already played today, no update.');
        return false;
      }
    } else {
      profile.dailyAttemptsStreak = 0;
      streakChanged = true;
      console.log('[BadgeProcessor] Streak reset to 0');
    }
  } else {
    profile.dailyAttemptsStreak = 1;
    streakChanged = true;
    console.log('[BadgeProcessor] First attempt, streak set to 1');
  }
  profile.lastAttemptDate = today;

  // Check for milestone
  const streak = profile.dailyAttemptsStreak;
  const badgeLevels = badge.badgelevel || [];
  let achievedLevel = -1;
  console.log('[BadgeProcessor] badgeLevels:', JSON.stringify(badgeLevels));
  console.log('[BadgeProcessor] streak:', streak);
  for (let i = badgeLevels.length - 1; i >= 0; i--) {
    console.log(`[BadgeProcessor] Checking milestone: ${badgeLevels[i].milestone} (level ${i})`);
    if (streak >= badgeLevels[i].milestone) {
      achievedLevel = i;
      console.log(`[BadgeProcessor] Milestone achieved: level ${i} (milestone ${badgeLevels[i].milestone})`);
      break;
    }
  }
  console.log('[BadgeProcessor] achievedLevel:', achievedLevel);
  if (achievedLevel >= 0) {
    // Check if this level for this badge has already been awarded for any session
    const alreadyAwarded = profile.badges.some(
      b => b.badgeId.toString() === badge._id.toString() && b.level === achievedLevel
    );
    if (!alreadyAwarded) {
      profile.badges.push({ badgeId: badge._id, level: achievedLevel, userLevelSessionId, createdAt: new Date() });
      updated = true;
      console.log(`[BadgeProcessor] Appended new Daily Streak badge for user ${profile.userId} at level ${achievedLevel}`);
    } else {
      console.log(`[BadgeProcessor] User ${profile.userId} already has Daily Streak badge at level ${achievedLevel} (any session)`);
    }
  } else {
    console.log(`[BadgeProcessor] User ${profile.userId} streak (${streak}) did not reach any milestone.`);
  }
  if (updated || streakChanged) {
    console.log('[BadgeProcessor] UserProfile badges/streak before save:', JSON.stringify(profile.badges, null, 2));
    await profile.save();
    console.log('[BadgeProcessor] UserProfile badges/streak after save:', JSON.stringify(profile.badges, null, 2));
  }
  console.log('[BadgeProcessor] --- End Daily Streak Badge Processing ---');
  return updated;
}

/**
 * Main badge processing function to be called after quiz ends.
 * @param userLevelSessionId string
 */
export async function processBadgesAfterQuiz(userLevelSessionId: string) {
  console.log('[BadgeProcessor] --- processBadgesAfterQuiz ---');
  // Fetch session
  const session = await UserLevelSession.findById(userLevelSessionId);
  if (!session) { console.log('[BadgeProcessor] No session found for', userLevelSessionId); return; }

  // Fetch user profile
  const userProfile = await UserProfile.findOne({ userId: session.userId });
  if (!userProfile) { console.log('[BadgeProcessor] No user profile found for', session.userId); return; }

  // Fetch all badges
  const allBadges = await Badge.find({});

  // Process Daily Streak badge (slug: 'ds_d')
  const dailyStreakBadge = allBadges.find(b => b.badgeslug === 'ds_d');
  if (dailyStreakBadge) {
    console.log(`[BadgeProcessor] Processing Daily Streak badge for user ${userProfile.userId}`);
    await processDailyStreakBadge(userProfile, dailyStreakBadge, new Date(), userLevelSessionId);
  }

  // Process Topics Collector badge (slug: 'tc_g')
  const topicsCollectorBadge = allBadges.find(b => b.badgeslug === 'tc_g');
  if (topicsCollectorBadge) {
    console.log(`[BadgeProcessor] Processing Topics Collector badge for user ${userProfile.userId}`);
    await processUniqueTopicsBadge(userProfile, topicsCollectorBadge, userLevelSessionId);
  }

  // TODO: Add logic for other badges (Questions Solved)
  console.log('[BadgeProcessor] --- End processBadgesAfterQuiz ---');
}

export async function processUniqueTopicsBadge(
  userProfile: UserProfileDocument,
  badge: any,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userLevelSessionId: string
): Promise<boolean> {
  let updated = false;
  // Only use userProfile.uniqueTopics (already merged in /end route)
  const uniqueTopicsCount = (userProfile.uniqueTopics || []).length;
  const badgeLevels = badge.badgelevel || [];
  let achievedLevel = -1;

  console.log('[BadgeProcessor] --- Unique Topics Badge Processing ---');
  console.log('[BadgeProcessor] User:', userProfile.userId);
  console.log('[BadgeProcessor] uniqueTopicsCount:', uniqueTopicsCount);
  console.log('[BadgeProcessor] badgeLevels:', JSON.stringify(badgeLevels));

  for (let i = badgeLevels.length - 1; i >= 0; i--) {
    if (uniqueTopicsCount >= badgeLevels[i].milestone) {
      achievedLevel = i;
      break;
    }
  }
  console.log('[BadgeProcessor] achievedLevel:', achievedLevel);

  if (achievedLevel >= 0) {
    // Check if this level for this badge has already been awarded for any session
    const alreadyAwarded = userProfile.badges.some(
      b => b.badgeId.toString() === badge._id.toString() &&
           b.level === achievedLevel
    );
    if (!alreadyAwarded) {
      userProfile.badges.push({
        badgeId: badge._id,
        level: achievedLevel,
        userLevelSessionId,
        createdAt: new Date()
      });
      updated = true;
      console.log(`[BadgeProcessor] Appended new Unique Topics badge for user ${userProfile.userId} at level ${achievedLevel}`);
    } else {
      console.log(`[BadgeProcessor] User ${userProfile.userId} already has Unique Topics badge at level ${achievedLevel} (any session)`);
    }
  } else {
    console.log(`[BadgeProcessor] User ${userProfile.userId} uniqueTopicsCount (${uniqueTopicsCount}) did not reach any milestone.`);
  }
  if (updated) {
    await userProfile.save();
    console.log('[BadgeProcessor] UserProfile badges after save:', JSON.stringify(userProfile.badges, null, 2));
  }
  console.log('[BadgeProcessor] --- End Unique Topics Badge Processing ---');
  return updated;
}
